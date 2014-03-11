#include <pebble.h>
#include <main.h>

Window *my_window;
TextLayer *content_layer;
TextLayer *title_layer;
ActionBarLayer* action_bar;

int GcurrentTid;
uint32_t Gduration;
struct tm *last_time;
char *Gdescription;

static const int TITLE_HEIGHT=50;
static const int TIME_ZONE_OFFSET=1;

GBitmap *icon_start;
GBitmap *icon_stop;

enum keys {
	APPMESS_start,
	APPMESS_stop,
	APPMESS_get,
	APPMESS_id,
	APPMESS_duration,
	APPMESS_description
};

void registerSecondTimeUnit() {
	tick_timer_service_subscribe(SECOND_UNIT ,updateCurrentTimer);
}

void setStartActionBar() {
	action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, icon_start);
 	action_bar_layer_set_click_config_provider(action_bar, (ClickConfigProvider) start_click_config_provider);
	action_bar_layer_clear_icon(action_bar, BUTTON_ID_DOWN);
 }

void setStopActionBar() {
	action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, icon_stop);
 	action_bar_layer_set_click_config_provider(action_bar, (ClickConfigProvider) stop_click_config_provider);
	action_bar_layer_clear_icon(action_bar, BUTTON_ID_UP);
 }

char* calculateDuration(struct tm *current_time, int duration) {
	unsigned int unix_time;
    unsigned int running_time;
    /* Convert time to seconds since epoch. */
    unix_time = ((0-TIME_ZONE_OFFSET)*3600) + /* time zone offset */ 
              + current_time->tm_sec /* start with seconds */
              + current_time->tm_min*60 /* add minutes */
              + current_time->tm_hour*3600 /* add hours */
              + current_time->tm_yday*86400 /* add days */
              + (current_time->tm_year-70)*31536000 /* add years since 1970 */
              + ((current_time->tm_year-69)/4)*86400 /* add a day after leap years, starting in 1973 */
              - ((current_time->tm_year-1)/100)*86400 /* remove a leap day every 100 years, starting in 2001 */
              + ((current_time->tm_year+299)/400)*86400; /* add a leap day back every 400 years, starting in 2001*/

    running_time = unix_time+duration;

	static char buf[64] = "";
	
	if (  running_time/(60*60) > 0 ) {
		snprintf(buf, sizeof(buf), "%u:%02u:%02u", running_time/(60*60), (running_time/60)%60, running_time%60);
	} else if ((running_time/60) > 0 ) {
		snprintf(buf, sizeof(buf), "%u:%02u", (running_time/60)%60, running_time%60);
	} else {
		snprintf(buf, sizeof(buf), "%02u seconds", running_time%60);
	}
	
	return buf;
}

void start() {
	DictionaryIterator *it;
	app_message_outbox_begin(&it);
	Tuplet p1 = TupletInteger(APPMESS_start, 1);

	dict_write_tuplet(it, &p1);
	app_message_outbox_send();
}

void stop(int id) {
	DictionaryIterator *it;
	app_message_outbox_begin(&it);
	Tuplet p1 = TupletInteger(APPMESS_stop, 1);
	Tuplet p2 = TupletInteger(APPMESS_id, GcurrentTid);

	dict_write_tuplet(it, &p1);
	dict_write_tuplet(it, &p2);
	app_message_outbox_send();
}

void get() {
	DictionaryIterator *it;
	app_message_outbox_begin(&it);
	Tuplet p1 = TupletInteger(APPMESS_get, 1);

	dict_write_tuplet(it, &p1);
	app_message_outbox_send();
}

void start_handler(ClickRecognizerRef recognizer, void *context) {
	start();
    text_layer_set_text(content_layer, "Timer is being started");
	setStartActionBar();
}

void stop_handler(ClickRecognizerRef recognizer, void *context) {
	stop(GcurrentTid);
	tick_timer_service_unsubscribe();
	static char buf[64] = "";
	snprintf(buf, sizeof(buf), "Your timer for '%s' was stopped after %s", Gdescription, calculateDuration(last_time,Gduration));
    text_layer_set_text(content_layer, buf);
	setStartActionBar();
}

void stop_click_config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_DOWN, stop_handler);
}

void start_click_config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_UP, start_handler);
}

void my_window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_frame(window_layer);
	GRect content_layer_bounds = GRect(3,bounds.origin.y+TITLE_HEIGHT,bounds.size.w-ACTION_BAR_WIDTH-10-3,bounds.size.h-TITLE_HEIGHT+10);
	
	title_layer = text_layer_create(GRect(0,0,bounds.size.w-ACTION_BAR_WIDTH-10,TITLE_HEIGHT));
	text_layer_set_background_color(title_layer, GColorWhite);
	text_layer_set_text_color(title_layer, GColorBlack);
	text_layer_set_text_alignment(title_layer, GTextAlignmentCenter);
	text_layer_set_font(title_layer, fonts_get_system_font(FONT_KEY_BITHAM_42_LIGHT));
	text_layer_set_text(title_layer, "Toggl");
	
	content_layer = text_layer_create(content_layer_bounds);
	text_layer_set_background_color(content_layer, GColorWhite);
	text_layer_set_text_color(content_layer, GColorBlack);
	text_layer_set_text_alignment(content_layer, GTextAlignmentCenter);
	text_layer_set_font(content_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18));
	text_layer_set_text(content_layer, "time to Toggl!");
	
	icon_start = gbitmap_create_with_resource (RESOURCE_ID_ICON_START_BLACK);
    icon_stop = gbitmap_create_with_resource (RESOURCE_ID_ICON_STOP_BLACK);
	
	action_bar = action_bar_layer_create();
  	
	action_bar_layer_add_to_window(action_bar, window);
 	layer_add_child(window_layer, text_layer_get_layer(title_layer));
	layer_add_child(window_layer, text_layer_get_layer(content_layer));
}

void updateCurrentTimer(struct tm *tick_time, TimeUnits units_changed) {
	static char buf[64] = "";
	last_time = tick_time;
	snprintf(buf, sizeof(buf), "A timer for '%s' is running for %s", Gdescription, calculateDuration(tick_time,Gduration));
    text_layer_set_text(content_layer, buf);
}


void updateSysCurrentTimer(Tuple *id, Tuple *duration, Tuple *description) {
	// Discover the current timer and display the duration and description
	// If no timer is present, offer the possibility to start a new one
	// Other wise offer the possibility to stop the current timer
	int idValue = id->value->int32;
	int durationValue = duration->value->uint32;
	char *descValue = description->value->cstring;
	
	GcurrentTid = idValue;
	Gduration = durationValue;
	Gdescription = descValue;
	APP_LOG(APP_LOG_LEVEL_DEBUG, "Id is %d and duration is %d",idValue,durationValue);
	
	registerSecondTimeUnit();
}

void my_window_unload(Window *window) {
	text_layer_destroy(title_layer);
	text_layer_destroy(content_layer);
	action_bar_layer_destroy(action_bar);
}

void handle_deinit(void) {
	  window_destroy(my_window);
}

void in_received_handler(DictionaryIterator *it, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Goodie I received somethingy!");	
	Tuple *currentTimer = dict_find(it,APPMESS_start);
	if ( currentTimer) {
		if ( strcmp(currentTimer->value->cstring,"1") == 0)  {
			APP_LOG(APP_LOG_LEVEL_INFO, "Goodie I received a running timer");	
			Tuple *id = dict_find(it,APPMESS_id);
			Tuple *duration = dict_find(it,APPMESS_duration);
			Tuple *description = dict_find(it,APPMESS_description);
			updateSysCurrentTimer(id,duration,description);
			setStopActionBar();
		} else {
			APP_LOG(APP_LOG_LEVEL_INFO, "Goodie I received not a timer at all!");
			tick_timer_service_unsubscribe();
			setStartActionBar();
			text_layer_set_text(content_layer, "No timer is currently running");
		}
	}
	APP_LOG(APP_LOG_LEVEL_DEBUG, "Finished inhandler");
}

void in_dropped_handler(AppMessageResult reason, void *context) {
	APP_LOG(APP_LOG_LEVEL_WARNING, "Something was received incorrectly");
}

void out_sent_handler(DictionaryIterator *it, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "I sent somethingy to theh interwebs");
}

void out_failed_handler(DictionaryIterator *it, AppMessageResult reasion, void *context) {
	APP_LOG(APP_LOG_LEVEL_WARNING, "Something was sent incorrectly");
}

void accel_tap_handler(AccelAxisType axis, int32_t direction) {
	get();
	text_layer_set_text(content_layer, "Fetching newest data from Toggl... Hang on");
}

void handle_init(void) {
	my_window = window_create();

	window_set_window_handlers(my_window, (WindowHandlers) {
		.load = my_window_load,
		.unload = my_window_unload,
	});

	app_message_register_inbox_received(in_received_handler);
	app_message_register_inbox_dropped(in_dropped_handler);
	app_message_register_outbox_sent(out_sent_handler);
	app_message_register_outbox_failed(out_failed_handler);
	
	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
    
	accel_tap_service_subscribe(&accel_tap_handler);
	
	window_stack_push(my_window, true);
}

int main(void) {
	  handle_init();
	  app_event_loop();
	  handle_deinit();
}