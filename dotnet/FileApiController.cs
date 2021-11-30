using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorldPrint.Models.Domain;
using WorldPrint.Services;
using WorldPrint.Web.Controllers;
using WorldPrint.Web.Models.Responses;
using System;
using System.Collections.Generic;

namespace WorldPrint.Web.Api.Controllers
{
    [Route("api/files")]
    [ApiController]
    public class FileApiController : BaseApiController

    {
        private IAuthenticationService<int> _authService = null;

        private IFileService _service = null;

        public FileApiController(IFileService service
            , IAuthenticationService<int> authService
            , ILogger<FileApiController> logger) : base(logger)
        {
            _service = service;
            _authService = authService;

        }

        [HttpPost("upload")]
        public ActionResult<ItemsResponse<UploadedFile>> Post(List<IFormFile> files)
        {
            ObjectResult result = null;

            try
            {
                int currentUserId = _authService.GetCurrentUserId();
                

                List<UploadedFile> newFiles = _service.Create(files, currentUserId);

                ItemsResponse<UploadedFile> response = new ItemsResponse<UploadedFile> { Items = newFiles };

                result = StatusCode(201, response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }

            return result;
        }



    }
}
