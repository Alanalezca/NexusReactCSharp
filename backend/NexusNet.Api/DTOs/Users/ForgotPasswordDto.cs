using System.ComponentModel.DataAnnotations;

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "L’adresse email est obligatoire.")]
    [EmailAddress(ErrorMessage = "L’adresse email est invalide.")]
    [MaxLength(254)]
    public string email { get; set; } = string.Empty;
}
