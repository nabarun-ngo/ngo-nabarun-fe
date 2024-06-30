export interface TileInfo {
    tile_html_id?:string;
    tile_name: string;
    tile_link: string;
    tile_icon: 'icon_rupee' | 'icon_book' | 'icon_group' | 'icon_credit_card' | 'icon_presentation' | 'icon_home' | 'icon_comment' | 'icon_globe' | 'icon_code';
    hide_tile?: boolean;
    additional_info?: {
        tile_value?: string;
        tile_label: string;
        tile_is_loading?: boolean;
        tile_show_badge: boolean;
    }
}