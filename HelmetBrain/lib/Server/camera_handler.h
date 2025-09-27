#ifndef CAMERA_HANDLER_H
#define CAMERA_HANDLER_H

#include "esp_http_server.h"

typedef struct {
  size_t size;   //number of values used for filtering
  size_t index;  //current value index
  size_t count;  //value count
  int sum;
  int *values;  //array to be filled with values
} ra_filter_t;

ra_filter_t *ra_filter_init(ra_filter_t *filter, size_t sample_size);

esp_err_t bmp_handler(httpd_req_t *req);
esp_err_t capture_handler(httpd_req_t *req);
esp_err_t stream_handler(httpd_req_t *req);
esp_err_t cmd_handler(httpd_req_t *req);
esp_err_t status_handler(httpd_req_t *req);
esp_err_t xclk_handler(httpd_req_t *req);
esp_err_t reg_handler(httpd_req_t *req);
esp_err_t greg_handler(httpd_req_t *req);
esp_err_t pll_handler(httpd_req_t *req);
esp_err_t win_handler(httpd_req_t *req);
esp_err_t index_handler(httpd_req_t *req);

#endif  // CAMERA_HANDLER_H