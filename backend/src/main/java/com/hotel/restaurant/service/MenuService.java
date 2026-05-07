package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.MenuDto;
import java.util.List;

public interface MenuService {
    List<MenuDto> getAllMenus();
    MenuDto getMenuById(Integer id);
    MenuDto createMenu(MenuDto dto);
    MenuDto updateMenu(Integer id, MenuDto dto);
    void deleteMenu(Integer id);
}
