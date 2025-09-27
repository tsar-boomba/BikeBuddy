#ifndef HELMET_SERVER_H
#define HELMET_SERVER_H

#include "esp_http_server.h"

void start_camera_server(httpd_handle_t stream_httpd, httpd_handle_t camera_httpd);

#endif  // HELMET_SERVER_H