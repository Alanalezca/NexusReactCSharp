
namespace NexusNet.Api.Dtos.Dicethrone;
public class DiceThroneBoxDto
{
    public string CodeBox { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string LienImg { get; set; } = string.Empty;
    public int Classement { get; set; }
    public int NbHeros { get; set; }
    public string Vague { get; set; }
}

public class DiceThroneHeroDto
{
    public string CodeHeros { get; set; } = string.Empty;
    public string CodeBox { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public string LienImg { get; set; } = string.Empty;
    public int Classement { get; set; }
    public string Vague { get; set; }
    public bool Pickable { get; set; }
}