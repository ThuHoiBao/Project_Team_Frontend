export class FeedbackResponseDTO {
  private _comment: string = '';
  private _rating: number = 0;
  private _orderItemId: string = '';
  private _images: File[] = [];

  get comment(): string {
    return this._comment;
  }
  set comment(value: string) {
    this._comment = value;
  }

  get orderItemId(): string {
    return this._orderItemId;
  }
  set orderItemId(value: string) {
    this._orderItemId = value;
  }

  get rating(): number {
    return this._rating;
  }
  set rating(value: number) {
    this._rating = value;
  }

  get images(): File[] {
    return this._images;
  }
  set images(value: File[]) {
    this._images = value;
  }

 // ✅ Tạo FormData với index để gom nhiều feedback
  toFormData(formData: FormData, index: number): void {
    formData.append(`feedbacks[${index}].comment`, this._comment);
    formData.append(`feedbacks[${index}].rating`, this._rating.toString());
    formData.append(`feedbacks[${index}].orderItemId`, this._orderItemId);

    this._images.forEach(file => {
      formData.append(`feedbacks[${index}].images`, file);
    });
  }
}
