using Microsoft.AspNetCore.Mvc;
using NexusNet.Api.Repositories.Sitemap;
using System.Text;
using System.Xml;

namespace NexusNet.Api.Controllers
{
    [ApiController]
    public class SitemapController : ControllerBase
    {
        private readonly ISitemapRepository _sitemapRepository;

        public SitemapController(ISitemapRepository sitemapRepository)
        {
            _sitemapRepository = sitemapRepository;
        }

        [HttpGet("/sitemap.xml")]
        public async Task<IActionResult> GetSitemap()
        {
            const string baseUrl = "https://alanalezca.fr";

            var articles = await _sitemapRepository.GetPublishedArticlesAsync();

            var builder = new StringBuilder();

            builder.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");

            var settings = new XmlWriterSettings
            {
                Indent = true,
                OmitXmlDeclaration = true
            };

            using (var writer = XmlWriter.Create(builder, settings))
            {
                writer.WriteStartElement(
                    "urlset",
                    "http://www.sitemaps.org/schemas/sitemap/0.9"
                );

                // Pages publiques fixes
                WriteUrl(writer, $"{baseUrl}/");
                WriteUrl(writer, $"{baseUrl}/smashup");
                WriteUrl(writer, $"{baseUrl}/dicethrone");
                WriteUrl(writer, $"{baseUrl}/keyforge");
                WriteUrl(writer, $"{baseUrl}/release/patchnotes");

                // Articles publiés
                foreach (var article in articles)
                {
                    WriteUrl(
                        writer,
                        $"{baseUrl}/article/view/{article.Slug}",
                        article.DateMaj
                    );
                }

                writer.WriteEndElement();
            }

            return Content(
                builder.ToString(),
                "application/xml",
                Encoding.UTF8
            );
        }

        private static void WriteUrl(
            XmlWriter writer,
            string url,
            DateTime? lastModified = null
        )
        {
            writer.WriteStartElement("url");

            writer.WriteElementString("loc", url);

            if (lastModified.HasValue)
            {
                writer.WriteElementString(
                    "lastmod",
                    lastModified.Value.ToString("yyyy-MM-dd")
                );
            }

            writer.WriteEndElement();
        }
    }
}