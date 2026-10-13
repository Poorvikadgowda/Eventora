import React from 'react';
import { useApp } from '../../store/AppContext';
import { Screen01Login } from './screens/Screen01Login';
import { Screen02Otp } from './screens/Screen02Otp';
import { Screen03Home } from './screens/Screen03Home';
import { Screen04UploadRx } from './screens/Screen04UploadRx';
import { Screen05ScanOcr } from './screens/Screen05ScanOcr';
import { Screen06ExtractedReview } from './screens/Screen06ExtractedReview';
import { Screen07GenericAlternatives } from './screens/Screen07GenericAlternatives';
import { Screen08PriceComparison } from './screens/Screen08PriceComparison';
import { Screen09NearbyPharmacies } from './screens/Screen09NearbyPharmacies';
import { Screen10PharmacyStock } from './screens/Screen10PharmacyStock';
import { Screen11AiChatbot } from './screens/Screen11AiChatbot';
import { Screen12MoleculeDetail } from './screens/Screen12MoleculeDetail';
import { Screen13PrescriptionVault } from './screens/Screen13PrescriptionVault';
import { Screen14FullMapLocator } from './screens/Screen14FullMapLocator';
import { Screen15HoldConfirmation } from './screens/Screen15HoldConfirmation';
import { Screen16MultilingualVoice } from './screens/Screen16MultilingualVoice';

export const FigmaScreenDispatcher = () => {
  const { figmaScreen } = useApp();

  switch (figmaScreen) {
    case 1:
      return <Screen01Login />;
    case 2:
      return <Screen02Otp />;
    case 3:
      return <Screen03Home />;
    case 4:
      return <Screen04UploadRx />;
    case 5:
      return <Screen05ScanOcr />;
    case 6:
      return <Screen06ExtractedReview />;
    case 7:
      return <Screen07GenericAlternatives />;
    case 8:
      return <Screen08PriceComparison />;
    case 9:
      return <Screen09NearbyPharmacies />;
    case 10:
      return <Screen10PharmacyStock />;
    case 11:
      return <Screen11AiChatbot />;
    case 12:
      return <Screen12MoleculeDetail />;
    case 13:
      return <Screen13PrescriptionVault />;
    case 14:
      return <Screen14FullMapLocator />;
    case 15:
      return <Screen15HoldConfirmation />;
    case 16:
      return <Screen16MultilingualVoice />;
    default:
      return <Screen03Home />;
  }
};
