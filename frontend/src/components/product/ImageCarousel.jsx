import React from 'react'
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

function ImageCarousel({steps}) {
    const [activeStep, setActiveStep] = React.useState(0);
    const maxSteps = steps.length;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
<Box sx={{ width: '100%' }}>
  <img
    src={steps[activeStep]}
    alt={`Image ${activeStep + 1}`}
    style={{
      width: '100%',
      borderRadius: '8px',
      objectFit: 'cover',
      /* maxHeight: '500px' */
    }}
  />
  <MobileStepper
    variant="dots"
    steps={maxSteps}
    position="static"
    activeStep={activeStep}
    nextButton={
      <Button onClick={handleNext} disabled={activeStep === maxSteps - 1}>
        Next <KeyboardArrowRight />
      </Button>
    }
    backButton={
      <Button onClick={handleBack} disabled={activeStep === 0}>
        <KeyboardArrowLeft /> Back
      </Button>
    }
  />
</Box>

    )
}

export default ImageCarousel