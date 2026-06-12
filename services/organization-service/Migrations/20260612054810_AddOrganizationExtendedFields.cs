using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vettly.OrganizationService.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanySize",
                schema: "organizations",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                schema: "organizations",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                schema: "organizations",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwitterUrl",
                schema: "organizations",
                table: "Organizations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanySize",
                schema: "organizations",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                schema: "organizations",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Location",
                schema: "organizations",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "TwitterUrl",
                schema: "organizations",
                table: "Organizations");
        }
    }
}
