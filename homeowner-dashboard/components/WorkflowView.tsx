
import { useState } from 'react';

interface WorkflowViewProps {
  jobId: number;
}

export default function WorkflowView({ jobId: _jobId }: WorkflowViewProps) {
  const [showUpload, setShowUpload] = useState(false);

  const workflow = {
    title: 'Kitchen Faucet Leak Repair',
    contractor: 'Elite Plumbing Solutions',
    startDate: 'May 15, 2024',
    estimatedCompletion: 'May 18, 2024',
    steps: [
      {
        id: 1,
        title: 'Initial Assessment',
        description: 'Inspect leak source and water damage',
        status: 'completed',
        date: 'May 15, 9:00 AM',
        photos: ['https://readdy.ai/api/search-image?query=Close-up%20photo%20of%20leaking%20kitchen%20faucet%20with%20water%20droplets%20and%20visible%20pipe%20connections%20showing%20plumbing%20issue%20in%20clean%20modern%20kitchen&width=400&height=300&seq=workflow-001&orientation=landscape'],
        notes: 'Leak confirmed at base connection. Minor cabinet damage detected.'
      },
      {
        id: 2,
        title: 'Parts Procurement',
        description: 'Order replacement faucet and seals',
        status: 'completed',
        date: 'May 15, 2:00 PM',
        photos: [],
        notes: 'Parts ordered from supplier. Expected delivery tomorrow morning.'
      },
      {
        id: 3,
        title: 'Faucet Replacement',
        description: 'Remove old faucet and install new unit',
        status: 'in-progress',
        date: 'May 17, 10:00 AM',
        photos: ['https://readdy.ai/api/search-image?query=Professional%20plumber%20installing%20new%20modern%20kitchen%20faucet%20with%20tools%20and%20parts%20visible%20showing%20installation%20process%20in%20bright%20clean%20kitchen&width=400&height=300&seq=workflow-002&orientation=landscape'],
        notes: 'Installation in progress. New faucet being fitted.'
      },
      {
        id: 4,
        title: 'Leak Testing',
        description: 'Test for leaks and water pressure',
        status: 'pending',
        date: 'May 17, 2:00 PM',
        photos: [],
        notes: ''
      },
      {
        id: 5,
        title: 'Cabinet Repair',
        description: 'Fix water-damaged cabinet area',
        status: 'pending',
        date: 'May 18, 9:00 AM',
        photos: [],
        notes: ''
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    if (!status) {
      return <i className="ri-checkbox-blank-circle-line text-gray-300 text-2xl"></i>;
    }
    
    switch (status) {
      case 'completed':
        return <i className="ri-checkbox-circle-fill text-[#00B8A9] text-2xl"></i>;
      case 'in-progress':
        return <i className="ri-loader-4-line text-[#FDC500] text-2xl animate-spin"></i>;
      default:
        return <i className="ri-checkbox-blank-circle-line text-gray-300 text-2xl"></i>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A74] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {workflow.title}
          </h2>
          <p className="text-sm text-[#333645] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Contractor: <strong>{workflow.contractor}</strong>
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="flex items-center gap-2">
              <i className="ri-calendar-line text-[#00B8A9]"></i>
              Started: {workflow.startDate}
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-calendar-check-line text-[#00B8A9]"></i>
              Est. Completion: {workflow.estimatedCompletion}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="px-6 py-3 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer flex items-center gap-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <i className="ri-upload-2-line"></i>
          Upload Image Update
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mb-6 p-4 bg-[#F9F9FB] rounded-lg border-2 border-dashed border-[#00B8A9]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-[#00B8A9]/10 rounded-full">
              <i className="ri-image-add-line text-2xl text-[#00B8A9]"></i>
            </div>
            <p className="text-sm font-semibold text-[#333645] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Upload Progress Photos
            </p>
            <button className="px-4 py-2 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
              Choose Files
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Timeline Icon */}
            <div className="flex flex-col items-center">
              {getStatusIcon(step.status)}
              {index < workflow.steps.length - 1 && (
                <div className={`w-0.5 h-full mt-2 ${
                  step.status === 'completed' ? 'bg-[#00B8A9]' : 'bg-gray-200'
                }`}></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {step.description}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.date}
                </span>
              </div>

              {step.notes && (
                <p className="text-sm text-[#333645] mb-3 bg-[#F9F9FB] p-3 rounded-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.notes}
                </p>
              )}

              {step.photos && step.photos.length > 0 && (
                <div className="flex gap-3">
                  {step.photos.map((photo, idx) => (
                    <div key={idx} className="w-32 h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={photo}
                        alt={`${step.title} photo ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          console.error(`Failed to load image: ${photo}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
