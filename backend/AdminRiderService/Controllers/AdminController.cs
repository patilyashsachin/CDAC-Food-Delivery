using AdminRiderService.Data;
using AdminRiderService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdminRiderService.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // ==================== ORDERS ====================

        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.Id,
                    CustomerName = o.UserEmail ?? "Unknown",
                    o.Status,
                    o.TotalAmount,
                    CreatedAt = o.OrderDate,
                    o.DeliveryAddress,
                    o.Items
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrder(long id)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            return Ok(order);
        }

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(long id, [FromBody] UpdateStatusRequest request)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Order not found" });

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully", order });
        }

        // ==================== RESTAURANTS ====================

        [HttpGet("restaurants")]
        public async Task<IActionResult> GetAllRestaurants()
        {
            var restaurants = await _context.Restaurants
                .OrderBy(r => r.Name)
                .ToListAsync();

            return Ok(restaurants);
        }

        [HttpGet("restaurants/{id}")]
        public async Task<IActionResult> GetRestaurant(long id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null)
                return NotFound(new { message = "Restaurant not found" });

            return Ok(restaurant);
        }

        [HttpPost("restaurants")]
        public async Task<IActionResult> CreateRestaurant([FromBody] Restaurant restaurant)
        {
            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRestaurant), new { id = restaurant.Id }, restaurant);
        }

        [HttpPut("restaurants/{id}")]
        public async Task<IActionResult> UpdateRestaurant(long id, [FromBody] Restaurant updatedRestaurant)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null)
                return NotFound(new { message = "Restaurant not found" });

            restaurant.Name = updatedRestaurant.Name ?? restaurant.Name;
            restaurant.Address = updatedRestaurant.Address ?? restaurant.Address;
            restaurant.Rating = updatedRestaurant.Rating;
            restaurant.Cuisine = updatedRestaurant.Cuisine ?? restaurant.Cuisine;
            restaurant.ImageUrl = updatedRestaurant.ImageUrl ?? restaurant.ImageUrl;
            restaurant.Price = updatedRestaurant.Price != 0 ? updatedRestaurant.Price : restaurant.Price;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Restaurant updated successfully", restaurant });
        }

        [HttpDelete("restaurants/{id}")]
        public async Task<IActionResult> DeleteRestaurant(long id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null)
                return NotFound(new { message = "Restaurant not found" });

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Restaurant deleted successfully" });
        }

        // ==================== USERS ====================

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .OrderBy(u => u.Name)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Phone,
                    u.Location
                })
                .ToListAsync();

            return Ok(users);
        }

        // ==================== INSIGHTS ====================

        [HttpGet("insights")]
        public async Task<IActionResult> GetInsights()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRestaurants = await _context.Restaurants.CountAsync();
            var totalUsers = await _context.Users.CountAsync();
            var totalRevenue = await _context.Orders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            return Ok(new
            {
                totalOrders,
                totalRestaurants,
                totalUsers,
                totalRevenue
            });
        }
    }

    public class UpdateStatusRequest
    {
        public string? Status { get; set; }
    }
}
