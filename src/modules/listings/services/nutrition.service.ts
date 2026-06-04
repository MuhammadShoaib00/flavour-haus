import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GetNutritionsResponse } from '../dto/nutritions.dto';

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(private readonly httpService: HttpService) {}

  async getNutritions(query: string): Promise<GetNutritionsResponse>{
    let nutrients = {
      calories: {value: 0, unit: "kcal"},
      total_fat: {value: 0, unit: "g"},
      saturated_fat: {value: 0, unit: "g"},
      cholesterol: {value: 0, unit: "mg"},
      sodium: {value: 0, unit: "mg"},
      total_carbohydrate: {value: 0, unit: "g"},
      dietary_fiber: {value: 0, unit: "g"},
      sugars: {value: 0, unit: "g"},
      protein: {value: 0, unit: "g"},
      potassium: {value: 0, unit: "mg"},
    };
    try {
      let connection = await firstValueFrom(
        this.httpService.post(`/natural/nutrients`, {query}),
      );
      // @ts-ignore
      if (connection.status == 200 || connection.status == 201) {
        // @ts-ignore
        const resp = connection.data;
        
        if(Array.isArray(resp.foods) && resp.foods.length > 0){
          for (const key in resp.foods) {
            nutrients.calories.value += Math.round(resp.foods[key].nf_calories);
            nutrients.total_fat.value += Math.round(resp.foods[key].nf_total_fat);
            nutrients.saturated_fat.value += Math.round(resp.foods[key].nf_saturated_fat);
            nutrients.cholesterol.value += Math.round(resp.foods[key].nf_cholesterol);
            nutrients.sodium.value += Math.round(resp.foods[key].nf_sodium);
            nutrients.total_carbohydrate.value += Math.round(resp.foods[key].nf_total_carbohydrate);
            nutrients.dietary_fiber.value += Math.round(resp.foods[key].nf_dietary_fiber);
            nutrients.sugars.value += Math.round(resp.foods[key].nf_sugars);
            nutrients.protein.value += Math.round(resp.foods[key].nf_protein);
            nutrients.potassium.value += Math.round(resp.foods[key].nf_potassium);
          }
        }
        return nutrients;
      }
      // @ts-ignore
      if (connection.data.error != undefined || connection.data.error != null) {
        //! remove this
        return nutrients;
        // @ts-ignore
        return connection.data.error;
      }
      // @ts-ignore
      throw new HttpException(connection.data, connection.status);
    } catch (err) {
      //! remove this
      return nutrients;
      throw err;
    }
  }
}

