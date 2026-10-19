public class ResetPasswordDto
{
    public string token { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
    public string passwordConfirmation { get; set; } = string.Empty;
}
