using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdminRiderService.Models
{
    [Table("hotels")]
    public class Restaurant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Column("name")]
        [Required]
        public string? Name { get; set; }

        [Column("cuisine")]
        public string? Cuisine { get; set; }

        [Column("location")]
        public string? Address { get; set; }

        [Column("rating")]
        public double Rating { get; set; } = 0.0;

        [Column("price")]
        public int Price { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }
    }
}
