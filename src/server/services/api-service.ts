import { Service } from "@flamework/core";
import { fetch } from "@rbxts/fetch";
import { HttpException } from "shared/exceptions";

interface GameApiError {
  readonly code: number;
  readonly message: string;
  readonly userFacingMessage: string;
}

interface ErrorBody {
  readonly errors: readonly GameApiError[];
}

interface SuccessBody<T> {
  readonly data: readonly T[];
}

interface GamepassInfo {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly productId: number;
  readonly price: number;
  readonly sellerName: number;
  readonly sellerId: number;
  readonly isOwned: number;

}

function didFail(body: object): body is ErrorBody {
  return "errors" in body;
}

@Service()
export class ApiService {
  private readonly gamepassesEndpoint = `https://games.roproxy.com/v1/games/${game.GameId}/game-passes?limit=100&sortOrder=Asc`;

  public async getGamepasses(): Promise<readonly GamepassInfo[]> {
    try {
      const body = await fetch(this.gamepassesEndpoint).then(res => res.json());
      if (didFail(body)) {
        const [err] = body.errors;
        throw new HttpException(`Failed to fetch game gamepass info: ${err.userFacingMessage} - ${err.message}`);
      }

      return (<SuccessBody<GamepassInfo>>body).data;
    } catch (e) {
      throw new HttpException(<string>e);
    }
  }
}