using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vettly.JobService.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                schema: "jobs",
                table: "Jobs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                schema: "jobs",
                table: "Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_OrganizationId",
                schema: "jobs",
                table: "Jobs",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Jobs_OrganizationId",
                schema: "jobs",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                schema: "jobs",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                schema: "jobs",
                table: "Jobs");
        }
    }
}
