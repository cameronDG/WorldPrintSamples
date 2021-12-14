using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/email")]
    [ApiController]
    public class EmailApiController : BaseApiController
    {
        private IEmailService _service = null;
        private IAuthenticationService<int> _authService = null;
        public EmailApiController(IEmailService service
            , ILogger<EmailApiController> logger
            , IAuthenticationService<int> authService) :base(logger)
        {
            _service = service;
            _authService = authService;
        }

        [HttpPost]
        public async Task<ActionResult<SuccessResponse>> SendEmail(EmailSendRequest email)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                await _service.SubscriptionEmail(email);
                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }

        [HttpPost("contactus")]
        public async Task<ActionResult<SuccessResponse>> ContactUs(EmailSendRequest email)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                await _service.ContactUs(email);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {

                Logger.LogError(ex.ToString());
                response = new ErrorResponse(ex.Message);
                code = 500;
            }

            return StatusCode(code, response);
        }

    }
}
