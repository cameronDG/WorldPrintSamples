using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Sabio.Data.Providers;
using Sabio.Models.AppSettings;
using Sabio.Models.Requests.Email;
using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.AspNetCore.Hosting;


namespace Sabio.Services
{
    public class EmailService : IEmailService
    {
        private AppKeys _appKeys = null;
        private IWebHostEnvironment _environment = null;

        public EmailService(IOptions<AppKeys> appKeys
            , IWebHostEnvironment environment)
        {
            _appKeys = appKeys.Value;
            _environment = environment;
        }


        public async Task SubscriptionEmail(EmailSendRequest email)
        {
            SendGridMessage msg = new SendGridMessage()
            {
                From = new EmailAddress("admin@world-prints.com", "World Prints"),
                Subject = email.Subject,
                PlainTextContent = "Thank you. Your subscription has been confirmed. You've been added to our list and will hear from us soon. World Prints",
                HtmlContent = System.IO.File.ReadAllText(_environment.WebRootPath + "/EmailTemplates/Subscription.html"),
            };
            msg.AddTo(new EmailAddress(email.Email, email.Name));
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&subject}}", msg.Subject);

            await SendEmail(msg).ConfigureAwait(false);
        }

        public async Task RegistrationEmail(string email, Guid token)
        {
            SendGridMessage msg = new SendGridMessage()
            {
                From = new EmailAddress("admin@world-prints.com", "World Prints"),
                Subject = "Welcome to World Prints! Please complete your registration",
                PlainTextContent = $"Thank you for creating a new account. Please finish registration by visiting https://localhost:3000/confirm?token={token}. World Prints",
                HtmlContent = System.IO.File.ReadAllText(_environment.WebRootPath + "/EmailTemplates/Registration.html"),
            };
            msg.AddTo(new EmailAddress(email));
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&subject}}", msg.Subject);
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&token}}", token.ToString());
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&API_HOST_PREFIX}}", "https://localhost:3000");

            await SendEmail(msg).ConfigureAwait(false);
        }

        public async Task ContactUs(EmailSendRequest email)
        {
            SendGridMessage msg = new SendGridMessage()
            {
                From = new EmailAddress(email.Email, email.Name),
                Subject = $"Message from {email.Name}",
                PlainTextContent = email.Message,
                HtmlContent = System.IO.File.ReadAllText(_environment.WebRootPath + "/EmailTemplates/ContactUs.html"),
            };
            msg.AddTo(new EmailAddress("wpadmin@dispostable.com", "World Prints"));
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&subject}}", email.Subject);
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&message}}", email.Message);
            msg.HtmlContent = msg.HtmlContent.Replace("{{&&email}}", email.Email);

            await SendEmail(msg).ConfigureAwait(false);
        }

        private async Task SendEmail(SendGridMessage msg)
        {
            var client = new SendGridClient(_appKeys.SendGridAppKey);
            var response = await client.SendEmailAsync(msg).ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(response.StatusCode.ToString());
            }

        }
    }
}
