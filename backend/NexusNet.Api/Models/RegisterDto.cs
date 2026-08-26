namespace NexusNet.Api.Models;

public class RegisterDto
{
    public string email { get; set; } = string.Empty;
    public string pseudo { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
}