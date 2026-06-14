using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vettly.OrganizationService.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOrganizationJoinRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationJoinRequests",
                schema: "organizations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationJoinRequests",
                schema: "organizations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecruiterId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationJoinRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationJoinRequests_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "organizations",
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationJoinRequests_OrganizationId",
                schema: "organizations",
                table: "OrganizationJoinRequests",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationJoinRequests_RecruiterId",
                schema: "organizations",
                table: "OrganizationJoinRequests",
                column: "RecruiterId");
        }
    }
}
