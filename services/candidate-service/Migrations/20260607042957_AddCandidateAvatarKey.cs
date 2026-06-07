using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vettly.CandidateService.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateAvatarKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarKey",
                schema: "candidate",
                table: "Profiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarKey",
                schema: "candidate",
                table: "Profiles");
        }
    }
}
