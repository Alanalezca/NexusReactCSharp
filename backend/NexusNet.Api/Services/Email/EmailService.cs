using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;

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

        message.Subject = "Validez votre compte sur Alanalezca.fr";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Bienvenue {pseudo} !</h2>

                <p>
                    Votre compte a bien été créé.
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
                    À bientôt sur Alanalezca.fr !
                </p>
                """
        };

        await SendAsync(message);
    }

    public async Task SendPasswordResetAsync(string email, string pseudo, string resetUrl)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("NexusNet", _configuration["Email:SmtpUsername"]));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = "Réinitialisez votre mot de passe sur Alanalezca.fr";

        var safePseudo = WebUtility.HtmlEncode(pseudo);
        var safeUrl = WebUtility.HtmlEncode(resetUrl);
        message.Body = new BodyBuilder
        {
            TextBody = $"Bonjour {pseudo},\n\nPour choisir un nouveau mot de passe : {resetUrl}\n\nCe lien est valable une heure. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email. Votre mot de passe reste inchangé.",
            HtmlBody = $"""
                <h2>Bonjour {safePseudo},</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p><a href="{safeUrl}">Choisir un nouveau mot de passe</a></p>
                <p>Ce lien est valable une heure. Toute nouvelle demande invalide le lien précédent.</p>
                <p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.
                Votre mot de passe reste inchangé.</p>
                """
        }.ToMessageBody();

        await SendAsync(message);
    }

    private async Task SendAsync(MimeMessage message)
    {
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
