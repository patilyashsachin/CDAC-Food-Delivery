using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRiderService.Models
{
    [Table("menu")]
    public class Menu
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public long Id { get; set; }

        [Column("hotel_id")]
        [Required]
        public long HotelId { get; set; }

        [Column("name")]
        [Required]
        public string? Name { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("price")]
        [Required]
        public int Price { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("food_type")]
        public string? FoodType { get; set; } // "VEG", "NON_VEG", "VEGAN"

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;
    }
}
