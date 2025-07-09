import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import json

def generate_pipeline_data():
    """
    Generate synthetic oil pipeline monitoring data matching the paper's structure
    """
    print("Generating oil pipeline monitoring data...")
    
    # Configuration
    config = {
        'num_pipelines': 5,
        'duration_hours': 24 * 30,  # 30 days
        'sampling_rate': 2,  # 2 seconds
        'leak_events': 12,
        'operational_events': 150
    }
    
    # Calculate total samples
    total_seconds = config['duration_hours'] * 3600
    total_samples = total_seconds // config['sampling_rate']
    
    print(f"Generating {total_samples:,} samples for {config['num_pipelines']} pipelines")
    
    # Initialize data structure
    data = []
    
    # Generate base time series
    timestamps = [datetime.now() + timedelta(seconds=i * config['sampling_rate']) 
                 for i in range(total_samples)]
    
    for pipeline_id in range(1, config['num_pipelines'] + 1):
        print(f"Processing pipeline {pipeline_id}/{config['num_pipelines']}")
        
        # Generate normal pressure data (1.5-2.5 MPa range)
        base_pressure = 2.0
        pressure_data = []
        frequency_data = []
        anomaly_labels = []
        anomaly_types = []
        
        for i in range(total_samples):
            time_hours = i * config['sampling_rate'] / 3600
            
            # Normal pressure with daily and hourly cycles
            normal_pressure = (base_pressure + 
                             0.3 * np.sin(2 * np.pi * time_hours / 24) +  # Daily cycle
                             0.1 * np.sin(2 * np.pi * time_hours / 1) +   # Hourly variation
                             0.05 * np.random.normal())  # Random noise
            
            # Normal pump frequency (20-30 Hz)
            normal_frequency = (25 + 
                              3 * np.sin(2 * np.pi * time_hours / 12) +  # Semi-daily cycle
                              0.5 * np.random.normal())  # Random noise
            
            pressure_data.append(normal_pressure)
            frequency_data.append(normal_frequency)
            anomaly_labels.append(False)
            anomaly_types.append('normal')
    
        # Add leak events (true anomalies)
        leak_events_added = 0
        for _ in range(config['leak_events']):
            if leak_events_added >= config['leak_events']:
                break
                
            # Random start time (avoid first and last 2 hours)
            start_sample = np.random.randint(3600, total_samples - 7200)
            duration_samples = np.random.randint(900, 3600)  # 30 minutes to 2 hours
            end_sample = min(start_sample + duration_samples, total_samples)
            
            # Check for overlap with existing anomalies
            overlap = False
            for j in range(start_sample, end_sample):
                if j < len(anomaly_labels) and anomaly_labels[j]:
                    overlap = True
                    break
            
            if not overlap:
                # Simulate gradual pressure drop for leak
                pressure_drop = 0.3 + np.random.random() * 0.5  # 0.3-0.8 MPa drop
                
                for j in range(start_sample, end_sample):
                    if j < len(pressure_data):
                        progress = (j - start_sample) / (end_sample - start_sample)
                        drop_factor = min(1.0, progress * 2)  # Gradual drop
                        
                        pressure_data[j] -= pressure_drop * drop_factor
                        # Add some noise to frequency but keep it relatively stable
                        frequency_data[j] += np.random.normal(0, 0.3)
                        anomaly_labels[j] = True
                        anomaly_types[j] = 'leak'
                
                leak_events_added += 1
        
        # Add operational events (false anomalies)
        operational_events_added = 0
        for _ in range(config['operational_events']):
            if operational_events_added >= config['operational_events']:
                break
                
            start_sample = np.random.randint(0, total_samples - 1800)
            duration_samples = np.random.randint(150, 900)  # 5-30 minutes
            end_sample = min(start_sample + duration_samples, total_samples)
            
            # Check for overlap with leak events
            overlap = False
            for j in range(start_sample, end_sample):
                if j < len(anomaly_types) and anomaly_types[j] == 'leak':
                    overlap = True
                    break
            
            if not overlap:
                # Simulate operational changes
                pressure_change = np.random.normal(0, 0.4)  # ±0.4 MPa
                frequency_change = np.random.normal(0, 5)   # ±5 Hz
                
                for j in range(start_sample, end_sample):
                    if j < len(pressure_data) and anomaly_types[j] == 'normal':
                        pressure_data[j] += pressure_change
                        frequency_data[j] += frequency_change
                        anomaly_labels[j] = True
                        anomaly_types[j] = 'operational'
                
                operational_events_added += 1
        
        # Create DataFrame for this pipeline
        pipeline_data = pd.DataFrame({
            'timestamp': timestamps,
            'pipeline_id': pipeline_id,
            'pressure_mpa': pressure_data,
            'frequency_hz': frequency_data,
            'is_anomaly': anomaly_labels,
            'anomaly_type': anomaly_types
        })
        
        data.append(pipeline_data)
    
    # Combine all pipeline data
    full_data = pd.concat(data, ignore_index=True)
    
    # Generate statistics
    stats = {
        'total_samples': len(full_data),
        'normal_samples': len(full_data[full_data['anomaly_type'] == 'normal']),
        'leak_anomalies': len(full_data[full_data['anomaly_type'] == 'leak']),
        'operational_anomalies': len(full_data[full_data['anomaly_type'] == 'operational']),
        'pipelines': config['num_pipelines'],
        'duration_days': config['duration_hours'] / 24,
        'sampling_rate_seconds': config['sampling_rate']
    }
    
    print("\nData Generation Complete!")
    print(f"Total samples: {stats['total_samples']:,}")
    print(f"Normal samples: {stats['normal_samples']:,} ({stats['normal_samples']/stats['total_samples']*100:.2f}%)")
    print(f"Leak anomalies: {stats['leak_anomalies']:,} ({stats['leak_anomalies']/stats['total_samples']*100:.4f}%)")
    print(f"Operational anomalies: {stats['operational_anomalies']:,} ({stats['operational_anomalies']/stats['total_samples']*100:.2f}%)")
    
    # Save data
    full_data.to_csv('pipeline_monitoring_data.csv', index=False)
    
    with open('data_statistics.json', 'w') as f:
        json.dump(stats, f, indent=2)
    
    # Create visualization
    plt.figure(figsize=(15, 10))
    
    # Sample one pipeline for visualization
    sample_pipeline = full_data[full_data['pipeline_id'] == 1].head(10000)
    
    plt.subplot(2, 1, 1)
    plt.plot(sample_pipeline.index, sample_pipeline['pressure_mpa'], 'b-', linewidth=0.5, alpha=0.7)
    
    # Highlight anomalies
    leak_indices = sample_pipeline[sample_pipeline['anomaly_type'] == 'leak'].index
    operational_indices = sample_pipeline[sample_pipeline['anomaly_type'] == 'operational'].index
    
    plt.scatter(leak_indices, sample_pipeline.loc[leak_indices, 'pressure_mpa'], 
               c='red', s=1, alpha=0.8, label='Leak Anomalies')
    plt.scatter(operational_indices, sample_pipeline.loc[operational_indices, 'pressure_mpa'], 
               c='orange', s=1, alpha=0.6, label='Operational Anomalies')
    
    plt.ylabel('Pressure (MPa)')
    plt.title('Pipeline Pressure Monitoring Data (Sample - First 10,000 points)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(2, 1, 2)
    plt.plot(sample_pipeline.index, sample_pipeline['frequency_hz'], 'g-', linewidth=0.5, alpha=0.7)
    plt.ylabel('Pump Frequency (Hz)')
    plt.xlabel('Sample Index')
    plt.title('Pump Frequency Data')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('pipeline_data_visualization.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    return full_data, stats

if __name__ == "__main__":
    data, statistics = generate_pipeline_data()
