import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { storage, database } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ROOT_FOLDER } from "../../hooks/useFolder";
import { v4 as uuidV4 } from "uuid";
import ReactDOM from "react-dom";
import { ProgressBar, Toast } from "react-bootstrap";

export default function AddFileButton({ currentFolder }) {
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const { currentUser } = useAuth();

    function handleUpdate(e) {
        const file = e.target.files[0];
        if (currentFolder == null || file == null) return;

        const id = uuidV4();
        setUploadingFiles((preUpLoadingFiles) => [
            ...preUpLoadingFiles,
            { id, name: file.name, progress: 0, error: false },
        ]);

        const filePath =
            currentFolder === ROOT_FOLDER
                ? `${currentFolder.path.map((obj) => obj.name).join("/")}/${
                      file.name
                  }`
                : `${currentFolder.path.map((obj) => obj.name).join("/")}/${
                      currentFolder.name
                  }/${file.name}`;

        const uploadTask = storage
            .ref(`/files/${currentUser.uid}/${filePath}`)
            .put(file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    snapshot.bytesTransferred / snapshot.totalBytes;
                setUploadingFiles((preUpLoadingFiles) => {
                    return preUpLoadingFiles.map((uploadFile) => {
                        if (uploadFile.id === id) {
                            return { ...uploadFile, progress };
                        }
                        return uploadFile;
                    });
                });
            },
            () => {
                setUploadingFiles((prevUploadingFiles) => {
                    return prevUploadingFiles.map((uploadFile) => {
                        if (uploadFile.id === id) {
                            return { ...uploadFile, error: true };
                        }
                        return uploadFile;
                    });
                });
            },
            () => {
                setUploadingFiles((preUpLoadingFiles) => {
                    return preUpLoadingFiles.filter((uploadFile) => {
                        return uploadFile.id !== id;
                    });
                });

                uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                    database.files
                        .where("name", "==", file.name)
                        .where("userId", "==", currentUser.uid)
                        .where("folderId", "==", currentFolder.id)
                        .get()
                        .then((existingFiles) => {
                            const existingFile = existingFiles.docs[0];
                            if (existingFile) {
                                existingFile.ref.update({ url });
                                alert(`${file.name} has been updated!`);
                            } else {
                                database.files.add({
                                    url,
                                    name: file.name,
                                    createdAt: database.getCurrentTimestamp(),
                                    folderId: currentFolder.id,
                                    userId: currentUser.uid,
                                });
                            }
                        });
                });
            }
        );
    }
    return (
        <>
            <label className="btn btn-outline-success btn-sm m-0 me-2">
                <FontAwesomeIcon icon={faFileUpload} />
                <input
                    type="file"
                    onChange={handleUpdate}
                    style={{
                        opacity: 0,
                        position: "absolute",
                        left: "-9999px",
                    }}
                />
            </label>
            {uploadingFiles.length > 0 &&
                ReactDOM.createPortal(
                    <div
                        style={{
                            position: "absolute",
                            bottom: "1rem",
                            right: "1rem",
                            maxWidth: "150px",
                        }}
                    >
                        {uploadingFiles.map((file) => (
                            <Toast
                                key={file.id}
                                onClose={() =>
                                    setUploadingFiles((preUpLoadingFiles) => {
                                        return preUpLoadingFiles.filter(
                                            (uploadFile) => {
                                                return (
                                                    uploadFile.id !== file.id
                                                );
                                            }
                                        );
                                    })
                                }
                            >
                                <Toast.Header
                                    closeButton={file.error}
                                    className="w-100 d-flex"
                                >
                                    <div className="flex-grow-1 overflow-hidden text-overflow-ellipsis">
                                        {file.name}
                                    </div>
                                </Toast.Header>
                                <Toast.Body>
                                    <ProgressBar
                                        animated={!file.error}
                                        variant={
                                            file.error ? "danger" : "primary"
                                        }
                                        now={
                                            file.error
                                                ? 100
                                                : file.progress * 100
                                        }
                                        label={
                                            file.error
                                                ? "Error"
                                                : `${Math.round(
                                                      file.progress * 100
                                                  )}%`
                                        }
                                    />
                                </Toast.Body>
                            </Toast>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}
