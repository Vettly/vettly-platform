using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vettly.CandidateService.Migrations
{
    /// <inheritdoc />
    public partial class RemoveResumeS3Url : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "S3Url",
                schema: "candidate",
                table: "Resumes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "S3Url",
                schema: "candidate",
                table: "Resumes",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}
