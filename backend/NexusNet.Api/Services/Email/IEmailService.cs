namespace NexusNet.Api.Services.Email;

public interface IEmailService
{
    Task SendPasswordResetAsync(string email, string pseudo, string resetUrl);

    Task SendEmailVerificationAsync(
        string email,
        string pseudo,
        string verificationUrl
    );
}
