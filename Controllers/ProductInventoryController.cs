using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductInventory.Data;
using ProductInventory.Dto;
using ProductInventory.Properties.Models;

namespace ProductInventory.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductInventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductInventoryController> _logger;
        public ProductInventoryController(ApplicationDbContext context, ILogger<ProductInventoryController> logger)
        {
            _context = context;
            _logger = logger;
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = new Product
            {
                id = Guid.NewGuid(),
                productCode = dto.ProductCode,
                productName = dto.ProductName,
                productImage = dto.ProductImage,
                CreateDate = DateTimeOffset.UtcNow,
                UpdateDate = DateTimeOffset.UtcNow,
                CreatedUser = dto.CreatedUser,
                IsFavorate = false,
                Active = true,
                HSNCODE = dto.HSNCode,
                TotalStock = 0,
                Variants = new List<Variant>()
            };

            foreach (var variant in dto.Variants)
            {
                var v = new Variant { Name = variant.Name, Options = new List<VariantOption>() };
                foreach (var option in variant.Options)
                {
                    v.Options.Add(new VariantOption { OptionValue = option });
                }
                product.Variants.Add(v);
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created product {ProductName}", dto.ProductName);
            return CreatedAtAction(nameof(GetProductById), new { id = product.id }, product);
        }

        [HttpGet]
        public async Task<IActionResult> ListProducts(int page = 1, int pageSize = 10)
        {
            var products = await _context.Products
                .Include(p => p.Variants)
                .ThenInclude(v => v.Options)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(products);
        }

        [HttpPost("stock/add")]
        public async Task<IActionResult> AddStock([FromBody] StockDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Product not found");

            product.TotalStock += dto.Quantity;
            _context.StockTransaction.Add(new StockTransaction
            {
                ProductId = dto.ProductId,
                VariantCombination = dto.VariantCombination,
                Quantity = dto.Quantity,
                TransactionDate = DateTimeOffset.UtcNow,
                Type = "Add"
            });

            await _context.SaveChangesAsync();
            return Ok(new { product.TotalStock });
        }

        [HttpPost("stock/remove")]
        public async Task<IActionResult> RemoveStock([FromBody] StockDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Product not found");

            if (product.TotalStock < dto.Quantity)
                return BadRequest("Not enough stock");

            product.TotalStock -= dto.Quantity;
            _context.StockTransaction.Add(new StockTransaction
            {
                ProductId = dto.ProductId,
                VariantCombination = dto.VariantCombination,
                Quantity = dto.Quantity,
                TransactionDate = DateTimeOffset.UtcNow,
                Type = "Remove"
            });

            await _context.SaveChangesAsync();
            return Ok(new { product.TotalStock });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            
            var product = await _context.Products
                .Include(p => p.Variants)
                .ThenInclude(v => v.Options)
                .FirstOrDefaultAsync(p => p.id == id);

            if (product == null) return NotFound();

            return Ok(product);
        }
    }
}
