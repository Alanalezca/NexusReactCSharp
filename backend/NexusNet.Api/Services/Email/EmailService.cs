using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace NexusNet.Api.Services.Email;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailVerificationAsync(
        string email,
        string pseudo,
        string verificationUrl)
    {
        var message = new MimeMessage();

        message.From.Add(new MailboxAddress(
            "NexusNet",
            _configuration["Email:SmtpUsername"]
        ));

        message.To.Add(MailboxAddress.Parse(email));

        message.Subject = "Validez votre compte NexusNet";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Bienvenue {pseudo} !</h2>

                <p>
                    Votre compte NexusNet a bien été créé.
                </p>

                <p>
                    Pour finaliser votre inscription, veuillez valider
                    votre adresse email en cliquant sur le lien suivant :
                </p>

                <p>
                    <a href="{verificationUrl}">
                        Valider mon adresse email
                    </a>
                </p>

                <p>
                    Ce lien est valable pendant 24 heures.
                </p>

                <p>
                    À bientôt sur NexusNet !
                </p>
                """
        };

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            _configuration["Email:SmtpHost"],
            int.Parse(_configuration["Email:SmtpPort"]!),
            SecureSocketOptions.SslOnConnect
        );

        await smtp.AuthenticateAsync(
            _configuration["Email:SmtpUsername"],
            _configuration["Email:SmtpPassword"]
        );

        await smtp.SendAsync(message);

        await smtp.DisconnectAsync(true);
    }
}