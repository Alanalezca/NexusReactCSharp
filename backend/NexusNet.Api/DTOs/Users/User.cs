public class User
{
    public int id { get; set; }

    public string email { get; set; } = string.Empty;

    public string password { get; set; } = string.Empty;

    public string pseudo { get; set; } = string.Empty;

    public string? statut { get; set; }

    public DateTime? datecreation { get; set; }

    public bool? accesblock { get; set; }

    public bool? suspendu { get; set; }

    public string? grade { get; set; }

    public int? role { get; set; }


    // Validation de l'adresse email

    public bool emailverifie { get; set; } = false;

    public string? hashtokenvalidationemail { get; set; }

    public DateTime? expirationtokenvalidationemail { get; set; }

    // Réinitialisation du mot de passe (jeton brut envoyé uniquement par email)
    public string? hashtokenreinitialisationpassword { get; set; }

    public DateTime? expirationtokenreinitialisationpassword { get; set; }
}
