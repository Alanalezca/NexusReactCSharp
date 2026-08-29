namespace NexusNet.Api.Services.Email;

public interface IEmailService
{
    Task SendEmailVerificationAsync(
        string email,
        string pseudo,
        string verificationUrl
    );
}