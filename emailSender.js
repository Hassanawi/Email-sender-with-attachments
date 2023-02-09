const http = require("http");
const xlsx = require("xlsx");
var nodemailer = require("nodemailer");

EmailSemder = function emailSender(
    senderEmail,
    password,
    subject,
    emailtext
) {

    attachmentspath = `./attachments/`
    workbook = xlsx.readFile('./Names_emails.xlsx');
    worksheet = workbook.SheetNames[0];
    worksheetName = workbook.Sheets[worksheet];
    var data1 = xlsx.utils.sheet_to_json(worksheetName);
    var md = data1;
    var range = xlsx.utils.decode_range(worksheetName["!ref"]);
    var rowscount = range.e.r;
    emailsent = 0
    emailNotSent = 0



    const c = counter(rowscount);
    c.finished.then(() => writingResponse(md));

    function counter(max) {
        let resolve = null;
        const finished = new Promise((resolveInternal) => {
            resolve = resolveInternal;
        });

        const count = () => {
            if (!--max) resolve();
        };

        return {
            count,
            finished,
        };
    }

    async function readingExcelFile() {
        var data2 = data1.map(async function (data) {

             setInterval(() => {

                response =  SendingEmail(
                    data.Names,
                    data.Emails,
                    async function (response, error) {
                        data.Response = response;
                        data.Error = error;
                        c.count();
                        return data;
                    }
                );

            }, 200)

        });
    }

    function writingResponse(newData) {
        newWorkBook = xlsx.utils.book_new();
        newWorksheet = xlsx.utils.json_to_sheet(newData);

        xlsx.utils.book_append_sheet(newWorkBook, newWorksheet, "responseSheet");
        xlsx.writeFile(newWorkBook, "Names_emails.xlsx");
        console.log("Emails sent :", emailsent)
        console.log("Emails failed :", emailNotSent)
    }

    async function SendingEmail(receiverName, receiverEmail, callback) {
        var transporter = await nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: senderEmail,
                pass: password, //have to allow gmail to send email through other app
            },
        });

        var mailOptions = {
            from: senderEmail,
            to: receiverEmail,
            subject: subject,
            text: emailtext,

            attachments: [
                {
                    path: `${attachmentspath}${receiverName}.pdf`,
                },
            ],
        };

        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                emailNotSent = emailNotSent + 1
                console.log(
                    "\u001b[31mEmail sending failed :",
                    error,
                    receiverName,
                    receiverEmail,
                    error.message,
                    "\u001b[37m"
                );
                if (error.code === 'EAUTH') {
                    return callback("Email sending failed", "Invalid email or password");
                }
                else if (error.code === 'EDNS') {
                    return callback("Email sending failed", "No internet connection");
                }
                else if (error.code === 'ESTREAM') {
                    return callback("Email sending failed", "Attachment file not found");
                }
                else if (error.code === 'EENVELOPE') {
                    return callback("Email sending failed", "Try again later");
                }
                else {
                    return callback("Email sending failed", '');
                }
            } else {
                emailsent = emailsent + 1
                console.log(
                    "\u001b[32mEmail sent sucessfully :",
                    receiverName,
                    receiverEmail,
                    "\u001b[37m"
                );
                return callback("Email sent", '');
            }
        });
    }

    function main() {
        readingExcelFile();
    }
    main()

    return emailsent, emailNotSent

}
module.exports = EmailSemder

