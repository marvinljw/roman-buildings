package com.example.romanbuildings.controller;

import com.example.romanbuildings.dto.RomanBuildingDTO;
import com.example.romanbuildings.model.RomanBuilding;
import com.example.romanbuildings.service.RomanBuildingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buildings")
public class RomanBuildingController {

    private final RomanBuildingService romanBuildingService;

    @Autowired
    public RomanBuildingController(RomanBuildingService romanBuildingService) {
        this.romanBuildingService = romanBuildingService;
    }

    @GetMapping
    public ResponseEntity<List<RomanBuildingDTO>> getAllBuildings() {
        List<RomanBuilding> buildings = romanBuildingService.getAllBuildings();
        List<RomanBuildingDTO> buildingDTOs = buildings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(buildingDTOs);
    }

    @PostMapping
    public ResponseEntity<RomanBuildingDTO> createBuilding(@RequestBody RomanBuildingDTO buildingDTO) {
        RomanBuilding building = convertToEntity(buildingDTO);
        RomanBuilding savedBuilding = romanBuildingService.saveBuilding(building);
        return ResponseEntity.ok(convertToDTO(savedBuilding));
    }

    private RomanBuildingDTO convertToDTO(RomanBuilding building) {
        return new RomanBuildingDTO(
                building.getId(),
                building.getName(),
                building.getLatitude(),
                building.getLongitude(),
                building.getDescription(),
                building.getImageUrl(),
                building.getYearBuilt(),
                building.getCountry(),
                building.isVisited()
        );
    }

    private RomanBuilding convertToEntity(RomanBuildingDTO dto) {
        RomanBuilding building = new RomanBuilding();
        building.setName(dto.getName());
        building.setLatitude(dto.getLatitude());
        building.setLongitude(dto.getLongitude());
        building.setDescription(dto.getDescription());
        building.setImageUrl(dto.getImageUrl());
        building.setYearBuilt(dto.getYearBuilt());
        building.setCountry(dto.getCountry());
        building.setVisited(dto.isVisited());
        return building;
    }
}