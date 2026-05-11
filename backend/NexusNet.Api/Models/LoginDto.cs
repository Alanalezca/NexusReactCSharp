namespace NexusNet.Api.Models;

public class LoginDto
{
    public string? loginOrEmail { get; set; }
    public string? email { get; set; }
    public string password { get; set; }  = null!;
}
