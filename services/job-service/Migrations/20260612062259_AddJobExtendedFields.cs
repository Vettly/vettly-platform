using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vettly.JobService.Migrations
{
    /// <inheritdoc />
    public partial class AddJobExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApplicationDeadline",
                schema: "jobs",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Benefits",
                schema: "jobs",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkArrangement",
                schema: "jobs",
                table: "Jobs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationDeadline",
                schema: "jobs",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Benefits",
                schema: "jobs",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "WorkArrangement",
                schema: "jobs",
                table: "Jobs");
        }
    }
}
