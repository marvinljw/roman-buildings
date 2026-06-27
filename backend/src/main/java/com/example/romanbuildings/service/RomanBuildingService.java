package com.example.romanbuildings.service;

import com.example.romanbuildings.model.RomanBuilding;
import com.example.romanbuildings.repository.RomanBuildingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RomanBuildingService {

    private final RomanBuildingRepository romanBuildingRepository;

    @Autowired
    public RomanBuildingService(RomanBuildingRepository romanBuildingRepository) {
        this.romanBuildingRepository = romanBuildingRepository;
    }

    public List<RomanBuilding> getAllBuildings() {
        return romanBuildingRepository.findAll();
    }

    public Optional<RomanBuilding> getBuildingById(Long id) {
        return romanBuildingRepository.findById(id);
    }

    public RomanBuilding saveBuilding(RomanBuilding romanBuilding) {
        return romanBuildingRepository.save(romanBuilding);
    }

    public void deleteBuilding(Long id) {
        romanBuildingRepository.deleteById(id);
    }
}