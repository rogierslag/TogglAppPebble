#include <pebble.h>



void registerSecondTimeUnit();

void setStartActionBar();

void setStopActionBar();

char* calculateDuration(struct tm *current_time, int duration);

void start();

void stop(int id);

void get();

void start_handler(ClickRecognizerRef recognizer, void *context);

void stop_handler(ClickRecognizerRef recognizer, void *context);

void stop_click_config_provider(void *context);

void start_click_config_provider(void *context);

void my_window_load(Window *window);

void updateCurrentTimer(struct tm *tick_time, TimeUnits units_changed);

void updateSysCurrentTimer(Tuple *id, Tuple *duration, Tuple *description);

void my_window_unload(Window *window);

void handle_deinit(void);

void in_received_handler(DictionaryIterator *it, void *context);

void in_dropped_handler(AppMessageResult reason, void *context);

void out_sent_handler(DictionaryIterator *it, void *context);

void out_failed_handler(DictionaryIterator *it, AppMessageResult reasion, void *context);

void handle_init(void);

int main(void);