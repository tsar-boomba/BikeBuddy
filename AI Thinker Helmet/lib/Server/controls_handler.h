#ifndef CONTROLS_HANDLER_H
#define CONTROLS_HANDLER_H

#include "esp_http_server.h"

esp_err_t left_signal_handler(httpd_req_t *req);
esp_err_t right_signal_handler(httpd_req_t *req);
esp_err_t brake_handler(httpd_req_t *req);

extern bool left_handler;
extern bool right_handler;
extern int break_status;

#endif  // CONTROLS_HANDLER_H