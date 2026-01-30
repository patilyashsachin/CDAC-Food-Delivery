using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRiderService.Models
{
    [Table("customer_orders")]
    public class Order
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("user_email")]
        [Required]
        public string? UserEmail { get; set; }

        [Column("status")]
        [Required]
        public string? Status { get; set; } // "Placed", "Preparing", "Out for Delivery", "Delivered"

        [Required]
        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column("order_date")]
        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Column("payment_method")]
        public string? PaymentMethod { get; set; }

        [Column("delivery_address")]
        public string? DeliveryAddress { get; set; }

        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
