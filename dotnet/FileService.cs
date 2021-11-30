using Amazon;
using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using WorldPrint.Data;
using WorldPrint.Data.Providers;
using WorldPrint.Models;
using WorldPrint.Models.AppSettings;
using WorldPrint.Models.Domain;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace WorldPrint.Services
{
    public class FileService : IFileService
    {

        IDataProvider _data = null;
        private AWSStorageConfig _awsConfig = null;
        public FileService(IDataProvider data, IOptions<AWSStorageConfig> awsConfig)
        {
            _data = data;
            _awsConfig = awsConfig.Value;
        }


        public List<UploadedFile> Create(List<IFormFile> files, int currentUserId)
        {
            string procName = "[dbo].[Files_Insert]";

            List<UploadedFile> newFiles = null;

            List<string> urls = null;

            DataTable batchUrls = null;

            if (files != null)
            {
                foreach (IFormFile file in files)
                {
                    string url = Upload(file).Result;

                    if (urls == null)
                    {
                        urls = new List<string>();
                    }

                    urls.Add(url);
                }
            }

            if (urls != null)
            {
                batchUrls = MapUrlsToTable(urls);
            }

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@BatchFileUrls", batchUrls);
                col.AddWithValue("@CurrentUserId", currentUserId);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                UploadedFile file = SingleFileMapper(reader);

                if (newFiles == null)
                {
                    newFiles = new List<UploadedFile>();
                }

                newFiles.Add(file);
            });

            return newFiles;
        }

        private UploadedFile SingleFileMapper(IDataReader reader)
        {
            UploadedFile file = new UploadedFile();
            int startingIndex = 0;

            file.Id = reader.GetSafeInt32(startingIndex++);
            file.Url = reader.GetSafeString(startingIndex++);

            return file;
        }

        private DataTable MapUrlsToTable(List<string> urls)
        {
            DataTable batchUrls = new DataTable();

            batchUrls.Columns.Add("Url", typeof(string));
            batchUrls.Columns.Add("FileType", typeof(string));

            foreach (string url in urls)
            {
                DataRow dr = batchUrls.NewRow();
                int startingIndex = 0;

                dr.SetField(startingIndex++, url);
                dr.SetField(startingIndex++, GetFileType(url));

                batchUrls.Rows.Add(dr);
            }
            return batchUrls;
        }


        private string GetFileType(string url)
        {
            string fileType = Enum.GetName(typeof(Filetypes), 1);

            string extension = url.Split(".")[^1].ToUpper();

            foreach (string type in Enum.GetNames(typeof(Filetypes)))
            {
                if (type == extension)
                {
                    fileType = type;
                    break;
                }
            }

            return fileType;
        }


        private async Task<string> Upload(IFormFile file)
        {
            string url = null;

            using (AmazonS3Client client = new AmazonS3Client(_awsConfig.AccessKey, _awsConfig.Secret, RegionEndpoint.USWest2))
            {
                TransferUtility transferUtility = new TransferUtility(client);

                string keyName = $"{Guid.NewGuid()}_WorldPrints_{file.FileName}";

                await transferUtility.UploadAsync(file.OpenReadStream(), _awsConfig.BucketName, keyName);

                url = _awsConfig.Domain + keyName;

            }

            return url;
        }
    }
}
