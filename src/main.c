#include <pebble.h>

Window *my_window;
TextLayer *content_layer;
TextLayer *title_layer;
ActionBarLayer* action_bar;

static const int TITLE_HEIGHT=50;

GBitmap *icon_start;
GBitmap *icon_stop;

void start() {
	
}

void stop(int id) {
	
}

void start_handler(ClickRecognizerRef recognizer, void *context) {
	text_layer_set_text(content_layer, "timer was started");
}

void stop_handler(ClickRecognizerRef recognizer, void *context) {
	text_layer_set_text(content_layer, "timer was stopped");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_UP, start_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, stop_handler);
}

void my_window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_frame(window_layer);
	GRect content_layer_bounds = GRect(bounds.origin.x,bounds.origin.y+TITLE_HEIGHT,bounds.size.w-ACTION_BAR_WIDTH-10,bounds.size.h-TITLE_HEIGHT);
	
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
	text_layer_set_font(content_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24));
	text_layer_set_text(content_layer, "time to Toggl!");
	
	icon_start = gbitmap_create_with_resource (RESOURCE_ID_ICON_START_BLACK);
    icon_stop = gbitmap_create_with_resource (RESOURCE_ID_ICON_STOP_BLACK);
	
	action_bar = action_bar_layer_create();
  	// Associate the action bar with the window:
 	action_bar_layer_set_click_config_provider(action_bar, (ClickConfigProvider) click_config_provider);
	action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, icon_start);
	action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, icon_stop);
	
	action_bar_layer_add_to_window(action_bar, window);
 	layer_add_child(window_layer, text_layer_get_layer(title_layer));
	layer_add_child(window_layer, text_layer_get_layer(content_layer));
	
	// Discover the current timer and display the duration and description
	// If no timer is present, offer the possibility to start a new one
	// Other wise offer the possibility to stop the current timer
}

void my_window_unload(Window *window) {
	text_layer_destroy(title_layer);
	text_layer_destroy(content_layer);
	action_bar_layer_destroy(action_bar);
}

void handle_deinit(void) {
	  window_destroy(my_window);
}

void handle_init(void) {
	my_window = window_create();

	window_set_window_handlers(my_window, (WindowHandlers) {
		.load = my_window_load,
		.unload = my_window_unload,
	});

	window_stack_push(my_window, true);
}

int main(void) {
	  handle_init();
	  app_event_loop();
	  handle_deinit();
}
