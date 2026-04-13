using TreasureAmu.API.Data;
using TreasureAmu.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ────────────────────────────────────────────────────────────
builder.Services.Configure<SupabaseConfig>(
    builder.Configuration.GetSection(SupabaseConfig.SectionName));

// ── HTTP Client (Supabase REST) ───────────────────────────────────────────────
builder.Services.AddHttpClient("Supabase", client =>
{
    client.DefaultRequestHeaders.Add("Content-Type", "application/json");
});

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IMemberService, MemberService>();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title       = "TreasureAmu API",
        Version     = "v1",
        Description = "Backend API for the TreasureAmu neighborhood listing community platform.",
        Contact     = new() { Name = "Amy Cox", Email = "Amy@geekamu.com" },
    });
});

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow Angular dev server and production origin
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TreasureAmu API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Redirect root to swagger in development
if (app.Environment.IsDevelopment())
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
