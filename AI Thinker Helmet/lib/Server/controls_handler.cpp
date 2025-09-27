#include "http_helper.h"
#include "controls_handler.h"
#include "esp_http_server.h"
#include "esp32-hal-log.h"


esp_err_t left_signal_handler(httpd_req_t *req) {
    char *query_str;
    if (parse_get(req, &query_str) == ESP_OK) {
        char status_val[8];
        log_i("full req %s\n", query_str);
        if (httpd_query_key_value(query_str, "status", status_val, sizeof(status_val)) == ESP_OK) {
            if (strcmp(status_val, "1") == 0) {
                log_i("Left signal is on\n");
            } else if (strcmp(status_val, "0") == 0) {
                log_i("Left signal is off\n");
            } else {
                log_i("Status parameter not found %s\n", status_val);
            }
        }
    }

    return ESP_OK;
}

esp_err_t right_signal_handler(httpd_req_t *req) {
    char *query_str;
    if (parse_get(req, &query_str) == ESP_OK) {
        char status_val[8];
        log_i("full req %s\n", query_str);
        if (httpd_query_key_value(query_str, "status", status_val, sizeof(status_val)) == ESP_OK) {
            if (strcmp(status_val, "1") == 0) {
                log_i("Right signal is on\n");
            } else if (strcmp(status_val, "0") == 0) {
                log_i("Right signal is off\n");
            } else {
                log_i("Right parameter not found %s\n", status_val);
            }
        }
    }

    return ESP_OK;
}