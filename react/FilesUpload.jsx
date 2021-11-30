import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "react-feather";
import debug from "sabio-debug";
import * as filesService from "@services/filesService";
import PropTypes from "prop-types";
import toastr from "toastr";

const _logger = debug.extend("FilesUpload");

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  height: 100,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

const FilesUpload = (props) => {
  const [files, setFiles] = useState([]);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: true,
    accept: "image/jpeg, image/png, image/tiff, application/pdf",
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const onUploadClick = () => {
    let formData = new FormData();

    acceptedFiles.forEach((file) => {
      formData.append("files", file);
    });

    filesService.post(formData).then(onPostSuccess).catch(onPostError);
  };

  const onPostSuccess = (response) => {
    props.sendFiles(response);
    toastr.success("File Uploaded");
    setFiles([]);
  };

  const onPostError = (error) => {
    toastr.error("File Upload Unsuccessul");
    _logger(error);
  };

  return (
    <div className="text-center">
      <div className="dropzone">
        <div {...getRootProps()}>
          <input {...getInputProps()} />

          <div className="d-50 btn-icon hover-scale-lg bg-white shadow-light-sm rounded-circle text-primary">
            <UploadCloud className="d-40" />
          </div>
        </div>
      </div>
      {files.length > 0 && (
        <div>
          <aside className="mt-1">{thumbs}</aside>
          <Button
            onClick={onUploadClick}
            size="sm"
            color="light"
            className="mt-2 hover-scale-sm btn-pill px-4"
          >
            Upload
          </Button>
        </div>
      )}
    </div>
  );
};

FilesUpload.propTypes = {
  sendFiles: PropTypes.func,
};

export default FilesUpload;
