function FileHandler(dependencies) {

    /// Dependencies
    var _console;
    var _fs;
    var _gridfs;

    var constructor = function () {
        _fs = dependencies.fs;
        _gridfs = dependencies.database.GetGridFS();
        _console = dependencies.console;
    }

    var createScreenshotFile = function (base64Data, fileName, callback) {
        fileName = fileName.toLowerCase();
        fileName = fileName.replace('c:/', '');
        fileName = fileName.replace('/', '');
        if (fileName[fileName.length - 1] == '/') { fileName = fileName.substring(0, fileName.length - 1); }

        fileName = (fileName === '' ? 'index' : fileName.replaceAll('/', '-')) + '.png';
        fileName = 'temp_files/' + fileName;
        var _base64Data = base64Data.replace(/^data:image\/png;base64,/, "");

        _fs.writeFile(fileName, _base64Data, 'base64', function (err) {
            if (err) { 
                _console.log(err, 'error');
             }

            _console.log('Temporary file saved successfully: ' + fileName, 'server-success');

            saveFile(fileName, function (result) {
                if (result != false) {
                    callback(result);
                }
                else {
                    callback(false);
                }
            })
        });
    }

    /// Streaming to GridFS
    var saveFile = function (filename, callback) {

        //filename to store in mongodb
        var writestream = _gridfs.createWriteStream({
            filename: filename
        });
        _fs.createReadStream(filename).pipe(writestream);

        writestream.on('close', function (file) {
            removeFile(filename, function (result) {
                if (result) {
                    _console.log('Deleted temporary file: ' + filename, 'server-success');
                    callback(file);
                }
                else {
                    callback(false);
                }
            })
        });
    }

    var removeFile = function (filename, callback) {
        _fs.unlink(filename, (err) => {
            if (err) {
                callback(false);
            }
            else {
                callback(true);
            }
        });
    }

    /// Streaming from GridFS
    var readFileById = function (id, callback) {
        var readstream = _gridfs.createReadStream({
            _id: id
        });

        callback(readstream);
    }

    return {
        Initialize: constructor,
        CreateScreenshotFile: createScreenshotFile,
        SaveFile: saveFile,
        RemoveFile: removeFile,
        ReadFileById: readFileById
    }
}

module.exports = FileHandler;