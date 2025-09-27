#ifndef HTTP_HELPER_H
#define HTTP_HELPER_H

#include "esp_https_server.h"

esp_err_t parse_get(httpd_req_t *req, char **obuf);

#endif  // HTTP_HELPER_H