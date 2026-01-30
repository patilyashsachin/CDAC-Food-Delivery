using System.Text;
using AdminRiderService.Data;
using AdminRiderService.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    try
    {
        context.Database.EnsureCreated();

        // Seed admin user
        var adminEmail = "admin@fooddelivery.com";
        if (!context.Users.Any(u => u.Email == adminEmail))
        {
            context.Users.Add(new User
            {
                Name = "System Admin",
                Email = adminEmail,
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "ADMIN",
                Phone = "0000000000",
                Address = "System",
                Pincode = "000000",
                Location = "System"
            });
            context.SaveChanges();
            Console.WriteLine("Admin user seeded successfully.");
        }

        // Seed sample restaurants if none exist
        if (!context.Restaurants.Any())
        {
            context.Restaurants.AddRange(
                new Restaurant { Name = "Spice Hub", Address = "MG Road, Pune", Rating = 4.5, Cuisine = "Indian", Price = 500 },
                new Restaurant { Name = "Food Fiesta", Address = "Andheri West, Mumbai", Rating = 4.2, Cuisine = "Multi-Cuisine", Price = 600 },
                new Restaurant { Name = "Pizza Palace", Address = "FC Road, Pune", Rating = 4.7, Cuisine = "Italian", Price = 400 },
                new Restaurant { Name = "Burger King", Address = "Connaught Place, Delhi", Rating = 4.3, Cuisine = "Fast Food", Price = 300 }
            );
            context.SaveChanges();
            Console.WriteLine("Sample restaurants seeded successfully.");
        }

        // Seed sample orders if none exist
        if (!context.Orders.Any())
        {
            var sampleUser = context.Users.FirstOrDefault(u => u.Role == "USER");
            var sampleRestaurant = context.Restaurants.FirstOrDefault();
            
            if (sampleUser != null)
            {
                context.Orders.AddRange(
                    new Order 
                    { 
                        UserEmail = sampleUser.Email, 
                        Status = "Preparing", 
                        TotalAmount = 450.00m,
                        OrderDate = DateTime.Now,
                        PaymentMethod = "UPI"
                    },
                    new Order 
                    { 
                        UserEmail = sampleUser.Email, 
                        Status = "Placed", 
                        TotalAmount = 320.00m,
                        OrderDate = DateTime.Now,
                        PaymentMethod = "COD"
                    }
                );
                context.SaveChanges();
                Console.WriteLine("Sample orders seeded successfully.");
            }
            else
            {
                Console.WriteLine("Skipping order seeding: No USER found.");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during database seeding: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        // Don't crash the app, just log the error
    }
}

app.Run();
