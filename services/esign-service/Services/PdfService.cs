using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Vettly.ESignService.Models;
using Document = Vettly.ESignService.Models.Document;

namespace Vettly.ESignService.Services;

public class PdfService
{
    private const string MutedColor = "#999999";

    private static readonly string[] MonthNames =
    [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    public static byte[] Render(Document document, Signature? signature)
    {
        var salary = document.SalaryAmount.ToString("N0");
        var startDate = $"{MonthNames[document.StartDate.Month - 1]} {document.StartDate.Day}, {document.StartDate.Year}";

        return QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(50);
                page.DefaultTextStyle(style => style.FontSize(11).FontColor("#1a1a1a"));

                page.Content().Column(column =>
                {
                    column.Item().Text(document.CompanyName ?? "Vettly")
                        .FontSize(11).LetterSpacing(0.05f).FontColor("#F4A340").Bold();

                    column.Item().PaddingTop(14).Text("Offer of Employment")
                        .FontSize(20).Bold().FontColor("#111111");

                    column.Item().PaddingTop(18).Text($"Dear {document.CandidateName},")
                        .LineHeight(1.6f);

                    column.Item().PaddingTop(10).Text(text =>
                    {
                        text.Line(
                            $"We are delighted to offer you the position of {document.JobTitle} " +
                            $"at {document.CompanyName ?? "our company"}. Your start date will be {startDate}.")
                            .LineHeight(1.6f);
                    });

                    column.Item().PaddingTop(10).Text(text =>
                    {
                        text.Span("Your annual base salary will be ");
                        text.Span($"${salary}").Bold();
                        text.Span(", paid semi-monthly, along with our standard benefits package.");
                    });

                    column.Item().PaddingTop(10).Text(
                        "We are excited about the contributions you will make to our team. " +
                        "Please sign below to accept this offer.")
                        .LineHeight(1.6f);

                    column.Item().PaddingTop(28).BorderTop(1).BorderColor("#e5e5e5").PaddingTop(18).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("COMPANY").FontSize(9).FontColor(MutedColor).LetterSpacing(0.05f);
                            col.Item().PaddingTop(8).Text(document.RecruiterName).Italic().FontSize(15);
                            col.Item().PaddingTop(6).BorderTop(1).BorderColor("#cccccc").PaddingTop(5)
                                .Text(document.CompanyName ?? "Vettly").FontSize(9).FontColor(MutedColor);
                        });

                        row.ConstantItem(30);

                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("CANDIDATE").FontSize(9).FontColor(MutedColor).LetterSpacing(0.05f);
                            if (signature is not null)
                            {
                                col.Item().PaddingTop(8).Text(signature.SignatureName).Italic().FontSize(15);
                                col.Item().PaddingTop(6).BorderTop(1).BorderColor("#cccccc").PaddingTop(5)
                                    .Text($"Signed {signature.SignedAt:MMM d, yyyy}").FontSize(9).FontColor(MutedColor);
                            }
                            else
                            {
                                col.Item().PaddingTop(8).Text(" ").FontSize(15);
                                col.Item().PaddingTop(6).BorderTop(1).BorderColor("#cccccc").PaddingTop(5)
                                    .Text(document.CandidateName).FontSize(9).FontColor(MutedColor);
                            }
                        });
                    });
                });
            });
        }).GeneratePdf();
    }
}
