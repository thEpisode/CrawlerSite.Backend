function MailController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mail;
    var _cross;

    /// Configuration
    var _fs;
    var _mailUser = '';
    var _mailPassword = '';
    var _mailDomain = '';
    var _mailPort = '';
    var _mailEncription = '';

    var _server;

    var constructor = function () {
        _cross = dependencies.cross;
        _console = dependencies.console;

        _fs = dependencies.fs;
        _path = dependencies.path;

        _mailUser = _cross.GetMailUser();
        _mailPassword = _cross.GetMailPassword();
        _mailDomain = _cross.GetMailDomain();
        _mailPort = _cross.GetMailPort();
        _mailEncription = _cross.GetMailEncryption();

        _mail = dependencies.mail;

        _server = _mail.server.connect({
            user: _mailUser,
            password: _mailPassword,
            host: _mailDomain,
            port: _mailPort,
            ssl: true
        });
    }

    var sendBasic = function (emailData, callback) {
        var message = {
            text: emailData.Text,
            from: (!!emailData.From) ? emailData.From : "Crawler Site Team <" + _mailUser + ">",
            to: emailData.To, //"Camilo <camilo.rodriguez@akeog.com>"
            cc: emailData.CC,
            subject: emailData.Subject,
        };

        _server.send(message, function (err, message) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when try to send email, try again.', result: err });
            }

            callback({ success: true, message: 'SendBasic', result: message });
        });
    }

    var sendComposed = function (emailData, callback) {
        composeWithBasicTemplate(emailData, function (emailDataTemplate) {
            var message = {
                text: emailData.Text,
                from: (!!emailData.From) ? emailData.From : "Crawler Site Team  <" + _mailUser + ">",
                to: emailData.To, //Better format: "Camilo <camilo.rodriguez@akeog.com>"
                cc: emailData.CC,
                subject: emailData.Subject,
                attachment:
                [
                    { data: emailDataTemplate, alternative: true }
                ]
            };

            _server.send(message, function (err, message) {
                if (err) {
                    _console.log(err, 'error');
                    callback({ success: false, message: 'Something went wrong when try to send email, try again.', result: err });
                }

                callback({ success: true, message: 'SendComposed', result: message });
            });
        })
    }

    var composeWithBasicTemplate = function (emailData, callback) {
        var path = _path.join(dependencies.root, "email_templates/");
        _fs.readFile(path + 'basic.html', 'utf8', function (err, data) {
            if (err) {
                _console.log(err, 'error');

                return null;
            };

            data = data.replace('{TITLE}', emailData.ComposedTitle);
            data = data.replace('{TITLE}', emailData.ComposedTitle);
            data = data.replace('{BODY}', emailData.ComposedBody);
            data = data.replace('{URLACTION}', emailData.ComposedUrlAction);
            data = data.replace('{TEXTACTION}', emailData.ComposedTextAction);
            data = data.replace('{COPYRIGHTDATE}', (new Date()).getFullYear());

            callback(data);
        });
    }

    return {
        Initialize: constructor,
        SendBasic: sendBasic,
        SendComposed: sendComposed,
    }
}

module.exports = MailController;