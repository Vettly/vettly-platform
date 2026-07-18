namespace Vettly.CandidateService.DTOs;

public class ScreeningResultRequest
{
    public float        AiScore      { get; set; }
    public float        MatchScore   { get; set; }
    public List<string> SkillGap     { get; set; } = [];
    public bool         BiasFlagged  { get; set; }
    public List<string> BiasFlags    { get; set; } = [];
}
